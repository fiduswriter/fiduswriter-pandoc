"""
Selenium tests for book export via pandoc-wasm.

Creates a book with two chapters (one containing an image) and exports it
via two different UI paths and to two different formats:

  1. test_book_pandoc_export_from_dialog
     Exports to Markdown via the "Export" dropdown in the book edit dialog.

  2. test_book_pandoc_export_from_overview
     Exports to reStructuredText via the bulk action menu on the overview.

Both verify that the resulting ZIP contains book.json, two chapter files,
the image binary, and that the chapter with the figure references the
image while the text-only chapter does not.
"""

import json
import os
import sys
import time
import zipfile
from tempfile import mkdtemp
from unittest import skipIf

from django.conf import settings
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

from testing.live_server import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper


@skipIf("book" not in settings.INSTALLED_APPS, "book plugin not installed")
class BookPandocTest(SeleniumHelper, ChannelsLiveServerTestCase):
    fixtures = [
        "initial_documenttemplates.json",
        "initial_styles.json",
        "initial_book_data.json",
    ]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.base_url = cls.live_server_url
        cls.download_dir = mkdtemp()
        driver_data = cls.get_drivers(1, cls.download_dir)
        cls.driver = driver_data["drivers"][0]
        cls.client = driver_data["clients"][0]
        cls.driver.implicitly_wait(driver_data["wait_time"])
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        for fname in os.listdir(cls.download_dir):
            try:
                os.remove(os.path.join(cls.download_dir, fname))
            except OSError:
                pass
        try:
            os.rmdir(cls.download_dir)
        except OSError:
            pass
        super().tearDownClass()

    def setUp(self):
        self.user = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter1"
        )

    def tearDown(self):
        super().tearDown()
        if "coverage" in sys.modules.keys():
            time.sleep(self.wait_time / 3)

    # ── helpers ──────────────────────────────────────────────────────────────

    def _insert_image_in_editor(self):
        """Insert a figure with an image into the currently open document."""
        image_path = os.path.join(
            settings.PROJECT_PATH, "pandoc/tests/uploads/image.png"
        )

        body = WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".doc-body"))
        )
        body.click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.XPATH, '//*[@title="Figure"]'))
        ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#figure-dialog span.math-field")
            )
        )
        time.sleep(1)

        self.driver.find_element(By.ID, "insert-figure-image").click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Add new image"]')
            )
        ).click()

        upload_input = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[@id="editimage"]/div[1]/input[2]')
            )
        )
        upload_input.send_keys(image_path)

        self.driver.find_element(
            By.XPATH,
            '//*[contains(@class, "fw-button") and normalize-space()="Upload"]',
        ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".fw-data-table i.fa-check")
            )
        )

        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Use image"]'
        ).click()

        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".doc-body figure")
            )
        )

    def _create_chapter_docs(self):
        """
        Create two documents on the server: "Chapter 1" (with an image) and
        "Chapter 2" (text only).  Assumes the user is already logged in and
        is on the documents overview page (`self.base_url + "/"`).
        """
        # ── Chapter 1 (with image) ───────────────────────────────────────────
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "Chapter 1"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "Content of chapter one."
        )
        self._insert_image_in_editor()
        time.sleep(1)
        self.driver.find_element(By.ID, "close-document-top").click()

        # ── Chapter 2 (text only) ────────────────────────────────────────────
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "Chapter 2"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "Content of chapter two."
        )
        time.sleep(1)
        self.driver.find_element(By.ID, "close-document-top").click()

    def _create_book(self, submit=True):
        """
        Navigate to the books overview, open the create-book dialog, set the
        title to "Test Book", and add both documents as chapters.

        If *submit* is True (default), the dialog is submitted (saved) and
        closed, returning to the overview table.  When False, the dialog
        stays open so that e.g. the Export button can be used inside it.
        """
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'a[href="/books/"]')
            )
        ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    'button[title="Create new book (Alt-n)"]',
                )
            )
        ).click()

        self.driver.find_element(By.ID, "book-title").send_keys("Test Book")

        # Switch to chapters tab
        self.driver.find_element(
            By.CSS_SELECTOR, 'a[href="#optionTab1"]'
        ).click()

        # Wait for the document list to be fully rendered before interacting.
        WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, "#book-document-list .fw-file")
            )
        )

        # Select the first document.
        self.driver.find_element(
            By.CSS_SELECTOR, "#book-document-list .fw-file .fw-file-name"
        ).click()
        # Ensure the file selector has actually marked it as selected.
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    "#book-document-list .fw-file .fw-file-name.fw-selected",
                )
            )
        )

        # Select the second document.
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#book-document-list .fw-file:nth-child(2) .fw-file-name",
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    "#book-document-list .fw-file .fw-file-name.fw-selected",
                )
            )
            == 2
        )

        # Add selected documents as chapters
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "add-chapter"))
        ).click()

        # Wait for the chapter rows to appear in the chapter list.
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, "#book-chapter-list tr")
            )
        )

        if submit:
            # Submit dialog to save book and return to the overview table
            submit_btn = WebDriverWait(self.driver, self.wait_time).until(
                EC.element_to_be_clickable(
                    (
                        By.XPATH,
                        '//*[contains(@class, "fw-button") '
                        'and normalize-space()="Submit"]',
                    )
                )
            )
            submit_btn.click()
            # Wait for the dialog to close before looking for the book list.
            WebDriverWait(self.driver, self.wait_time * 2).until(
                EC.invisibility_of_element_located(
                    (By.CSS_SELECTOR, ".fw-dialog")
                )
            )
            # The table re-renders after a save; wait for the book title.
            WebDriverWait(self.driver, self.wait_time).until(
                EC.visibility_of_element_located(
                    (By.CSS_SELECTOR, ".book-title")
                )
            )

    @staticmethod
    def _verify_zip(zip_path, ext):
        """
        Open the ZIP at *zip_path* and assert:
          - book.json is present
          - Two chapter files with the given *ext* exist
          - At least one image file (png/jpg/jpeg/gif/svg) is present
          - The image file has non-zero size
          - Chapter 0's content references an image filename
          - Chapter 1's content does NOT reference an image filename
          - book.json has the correct title and chapter count
        """
        with zipfile.ZipFile(zip_path, "r") as zf:
            names = zf.namelist()

            assert "book.json" in names, "ZIP is missing book.json"

            # ── chapter files ────────────────────────────────────────────────
            chapter_files = [
                n
                for n in names
                if n.startswith("chapters/") and not n.endswith("/")
            ]
            assert len(chapter_files) == 2, (
                f"Expected 2 chapter files, got {len(chapter_files)}: "
                f"{chapter_files}"
            )
            for cf in chapter_files:
                assert cf.endswith(
                    f".{ext}"
                ), f"Chapter file '{cf}' does not end with .{ext}"

            # ── image file ───────────────────────────────────────────────────
            image_extensions = (".png", ".jpg", ".jpeg", ".gif", ".svg")
            image_files = [
                n
                for n in names
                if any(n.lower().endswith(e) for e in image_extensions)
            ]
            assert len(image_files) >= 1, (
                f"Expected at least one image file in ZIP, found none. "
                f"All entries: {names}"
            )
            # Verify the image is not an empty placeholder
            for img in image_files:
                info = zf.getinfo(img)
                assert info.file_size > 0, f"Image file '{img}' has zero bytes"

            # ── image reference in chapter content ───────────────────────────
            ch0 = [n for n in chapter_files if n.startswith("chapters/0/")][0]
            ch0_content = zf.read(ch0).decode("utf-8")
            # Chapter 0 should contain at least one filename from image_files
            image_ref_found = any(
                img_filename in ch0_content for img_filename in image_files
            )
            assert image_ref_found, (
                f"Chapter 1 should reference an image. "
                f"Image files in ZIP: {image_files}. "
                f"Chapter content (first 300 chars): {ch0_content[:300]}"
            )

            ch1 = [n for n in chapter_files if n.startswith("chapters/1/")][0]
            ch1_content = zf.read(ch1).decode("utf-8")
            image_ref_in_ch1 = any(
                img_filename in ch1_content for img_filename in image_files
            )
            assert not image_ref_in_ch1, (
                f"Chapter 2 should NOT reference an image. "
                f"Image files in ZIP: {image_files}. "
                f"Chapter content (first 300 chars): {ch1_content[:300]}"
            )

            # ── book.json metadata ───────────────────────────────────────────
            book_data = json.loads(zf.read("book.json"))
            assert (
                book_data["title"] == "Test Book"
            ), f"Expected title 'Test Book', got '{book_data['title']}'"
            assert len(book_data["chapters"]) == 2, (
                f"Expected 2 chapters in book.json, "
                f"got {len(book_data['chapters'])}"
            )

    # ── tests ────────────────────────────────────────────────────────────────

    def test_book_pandoc_export_from_dialog(self):
        """
        Export a book to Markdown via the "Export" dropdown in the
        book edit dialog.
        """
        self.login_user(self.user, self.driver, self.client)
        self.driver.get(self.base_url + "/")

        self._create_chapter_docs()
        self._create_book(submit=False)

        # ── Export via the dialog's "Export" button ──────────────────────────
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    '//*[contains(@class, "fw-button") '
                    'and normalize-space()="Export"]',
                )
            )
        ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    '//*[normalize-space()="Export as Markdown (via Pandoc)"]',
                )
            )
        ).click()

        time.sleep(5)

        expected_zip = os.path.join(
            self.download_dir, "test-book.markdown.zip"
        )
        self.wait_until_file_exists(expected_zip, self.wait_time)
        self.assertTrue(os.path.isfile(expected_zip))
        self._verify_zip(expected_zip, "md")
        os.remove(expected_zip)

    def test_book_pandoc_export_from_overview(self):
        """
        Export a book to reStructuredText via the bulk action menu
        on the books overview page.
        """
        self.login_user(self.user, self.driver, self.client)
        self.driver.get(self.base_url + "/")

        self._create_chapter_docs()
        self._create_book()

        # The book was just created — the edit dialog has been closed and we
        # are back on the overview table.  Tick the checkbox for the book.
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "tr:nth-child(1) > td > label")
            )
        ).click()

        # Open the bulk action dropdown
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()

        # Click the pandoc reStructuredText export item
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    '//*[normalize-space()="Export selected as reStructuredText (via Pandoc)"]',
                )
            )
        ).click()

        time.sleep(5)

        expected_zip = os.path.join(self.download_dir, "test-book.rst.zip")
        self.wait_until_file_exists(expected_zip, self.wait_time)
        self.assertTrue(os.path.isfile(expected_zip))
        self._verify_zip(expected_zip, "rst")
        os.remove(expected_zip)
