# Generating keys

Run

`choco install openssl.lite`

Type the command below under the bin folder which includes a www file

`openssl genrsa 1024 > private.key`

`openssl req -new -key private.key -out cert.csr`

`openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem`

