<<<<<<< HEAD
export const getRemediation = (header) => {
  const tips = {
    "Content-Security-Policy": "Define allowed sources for content. Use 'default-src self'.",
    "X-Frame-Options": "Set to 'DENY' or 'SAMEORIGIN' to prevent clickjacking.",
    "Strict-Transport-Security": "Enable HSTS to force HTTPS connections.",
    "X-Content-Type-Options": "Set to 'nosniff' to prevent MIME-type sniffing.",
    "Referrer-Policy": "Control how much referrer information is sent with requests.",
    "Permissions-Policy": "Restrict which browser features can be used by the site."
  };
  return tips[header] || "Follow OWASP best practices for this header.";
};
=======
export const getRemediation = (header) => {
  const tips = {
    "Content-Security-Policy": "Define allowed sources for content. Use 'default-src self'.",
    "X-Frame-Options": "Set to 'DENY' or 'SAMEORIGIN' to prevent clickjacking.",
    "Strict-Transport-Security": "Enable HSTS to force HTTPS connections.",
    "X-Content-Type-Options": "Set to 'nosniff' to prevent MIME-type sniffing.",
    "Referrer-Policy": "Control how much referrer information is sent with requests.",
    "Permissions-Policy": "Restrict which browser features can be used by the site."
  };
  return tips[header] || "Follow OWASP best practices for this header.";
};
>>>>>>> 0510cffcc274c190e89605dab044d8cef3ff320d
