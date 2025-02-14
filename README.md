# FidusWriter-Pandoc

FidusWriter-Pandoc is a Fidus writer plugin to connect a Fidus Writer instance
with Pandoc for document conversion.

**NOTE:** There are two ways to run this: Either A) with pandoc running as a wasm executable in the user's browser, or B) connecting to pandoc running on a server. A is easier to set up and requires fewer resources on the server. B requires
fewer resources by users and their browsers. A is the default.

## A. Installation running as a wasm executable

1. Install Fidus Writer with the correct version of the plugin like this:

```
pip install fiduswriter[pandoc]
```

2. Add "pandoc" to your INSTALLED_APPS setting in the configuration.py file
   like this::

```python
INSTALLED_APPS += (
    ...
    'pandoc',
)
```

3. Create the needed JavaScript files by running this::

```
python manage.py transpile
```

4. (Re)start your Fidus Writer server.


## B. Installation running on a server


1. Install Pandoc and make it run as a server.

2. Install Fidus Writer with the correct version of the plugin like this:

```
pip install fiduswriter[pandoc]
```

3. Add "pandoc_on_server" to your INSTALLED_APPS setting in the configuration.py file
   like this::

```python
INSTALLED_APPS += (
    ...
    'pandoc_on_server',
)
```

4. Add a setting for the URL where you are running Pandoc in the configuration.py file like this:

```python
PANDOC_URL = 'http://localhost:3030'
```

5. Create the needed JavaScript files by running this::

```
python manage.py transpile
```

6. (Re)start your Fidus Writer server.

## Running pandoc as a server

To run pandoc as a server just type:

```
pandoc server
```

This will start it in server mode running on port 3030.
