# Slothefy
Sync and download music from VK and Spotify.

### To run

* You'll need to have [git](https://git-scm.com/) and [node](https://nodejs.org/en/) installed in your system.
* Fork and clone the project:

```
> $ git clone -b develop https://github.com/ifamed/slothMusic.git
```

* Then install the dependencies:

```
> $ npm install
```

* Run development server:

```
> $ npm start
```

Open the web browser to `http://localhost:8888/`

### To build production package

```
> $ npm run build
```

### Nginx Config

Here is the suggested Nginx config:
```
server {
	# ... root and other options

	gzip on;
	gzip_http_version 1.1;
	gzip_types text/plain text/css text/xml application/javascript image/svg+xml;

	location ~ \.html?$ {
		expires 1d;
	}

	location ~ \.(svg|ttf|js|css|svgz|eot|otf|woff|jpg|jpeg|gif|png|ico)$ {
		access_log off;
		log_not_found off;
		expires max;
	}
}
```

### Eslint
There is a .eslint.yaml config for eslint ready with React plugin.
To use it, you need to install additional dependencies though:

```
> npm install --save-dev eslint eslint-plugin-react
```

To do the actual linting, run:

```
> npm run lint
```

### Notes on importing css styles
* styles having /src/ in their absolute path are considered part of the application and exported as local css modules.
* styles having /node_modules|global/ in their absolute path are considered global styles used by many components and are included in the css bundle directly.
