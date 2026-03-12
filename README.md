# FidusWriter-Pandoc

FidusWriter-Pandoc is a Fidus writer plugin to connect a Fidus Writer instance
with Pandoc for document conversion.

**NOTE:** This runs pandoc as a wasm executable in the user's browser. For Fidus Writer 4.0 there was also the option to run it on the server (which required fewer resources by users and their browsers but more by the server). Due to resource restraints, running on the server is no longer supported. Please contact us if you want to revive this mode.

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

3. Create the needed JavaScript files by running this::

```
python manage.py transpile
```

4. (Re)start your Fidus Writer server.
