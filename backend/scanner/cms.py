import requests
import re

def detect_cms(url):
    try:
        response = requests.get(url, timeout=10)
        html = response.text.lower()

        cms_patterns = {
            "WordPress": r"wp-content|wp-includes",
            "Joomla": r"joomla",
            "Drupal": r"drupal",
            "Shopify": r"shopify",
            "Wix": r"wix\.com"
        }

        for cms, pattern in cms_patterns.items():
            if re.search(pattern, html):
                return cms

        return "Custom Stack"
    except:
        return "Unknown"
