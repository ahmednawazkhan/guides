## HTTPOnly Cookie

add this to your http block in `nginx.conf`

`proxy_cookie_path / "/; HTTPOnly; Secure";`