Firefox Pulse Uptake Rate Experiment Addon (Test Pilot)
=========================================================



Development
===============

- needs webpack
  ```
  npm install -g webpack
  npm install style-loader css-loader url-loader
  ```

- rebuild js for widgets:
  ```
  cd data
  webpack
  ```

If you want progress watchers...

  ```
  webpack --progress --colors --watch &
  # note, will need to be restarted if you 'add' more files
  # or alter webpack config
  ```
