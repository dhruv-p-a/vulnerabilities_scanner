import socket
import ssl
from urllib.parse import urlparse

def check_ssl(url):
    try:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname
        if not hostname:
            return "Invalid Hostname", 0

        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return "Valid", 15 # Contribution to score
    except Exception as e:
        return f"Invalid or No SSL ({str(e)})", 0
