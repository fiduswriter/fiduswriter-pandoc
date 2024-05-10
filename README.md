# FidusWriter-Pandoc

FidusWriter-Pandoc is a Fidus writer plugin to connect a Fidus Writer instance
with Pandoc for document conversion.

**NOTE:** You should first install Pandoc and make it run as a server. It is included in the Ubuntu Snap version of Fidus Writer so that will be the simplest way to install it for 99% of users.

## Installation

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

3. Add a setting for the URL where you are running Pandoc in the configuration.py file like this:

```python
PANDOC_URL = 'http://localhost:3030'
```

4. Create the needed JavaScript files by running this::

```
python manage.py transpile
```

5. (Re)start your Fidus Writer server.
