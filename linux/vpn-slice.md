## VPN Slice

only routes selected traffic through vpn without routing all of your traffic

### Installation

- `dnf install python3-devel`

- `pip3 install https://github.com/dlenski/vpn-slice/archive/master.zip`

### Usage 

`echo "<your-vpn-password>" | sudo openconnect --authgroup=<auth-group> --user=<username> --token-mode=totp --no-dtls --token-secret=base32:<otp-secret> "<vpn-host-address>" -s 'google.com paypal.com <space-separated-list-of-sites>'`

fill in 
- `<your-vpn-password>`
- `<auth-group>`
- `<username>`
- `<otp-secret>`
- `<space-separated-list-of-sites>` append list of ip address you want to split tunnel with ( route them through VPN ) like 'google.com paypal.com'