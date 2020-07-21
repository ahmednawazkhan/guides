#! /bin/sh

# install openconnect and vpn-slice. Enter your password, username and secret key 
#( generated from QR code ), Auth Group (AFINITI_VPN in this case) and list of all 
#the ip-address you wish to make vpn tunnel for. start this script on OS startup

VPN="vpnlhr.afiniti.com"

while :
do 
        echo "<password>" | sudo openconnect --authgroup=AFINITI_VPN --user=<username> --token-mode=totp --no-dtls --token-secret=base32:<secret> $VPN -s 'vpn-slice google.com youtube.com <list-of-space-separated-urls>'
        sleep 10
done
