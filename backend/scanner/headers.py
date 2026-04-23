import requests

def analyze_headers(url):
    try:
        response = requests.get(url, timeout=10)
        headers = response.headers

        security_headers = {
            "Content-Security-Policy": "Missing",
            "X-Frame-Options": "Missing",
            "Strict-Transport-Security": "Missing",
            "X-Content-Type-Options": "Missing",
            "Referrer-Policy": "Missing"
        }

        passed_count = 0
        for header in security_headers.keys():
            if header in headers:
                security_headers[header] = "Present"
                passed_count += 1

        # Calculate a basic score contribution (out of 70)
        score_contribution = (passed_count / len(security_headers)) * 70

        return security_headers, int(score_contribution)
    except Exception as e:
        return {}, 0
