import re

COUNTRY_CODE = "998"
SUBSCRIBER_LENGTH = 9

# Two-digit prefixes actually issued in Uzbekistan — mobile operators plus the
# geographic codes (71 is Tashkent). A length check alone would happily accept
# +998 11 111 11 11, which is what most junk submissions look like.
# 90–99 is taken as a whole range on purpose: operators get new codes issued
# (92 is the Academy's own number), and rejecting a real customer is far worse
# than accepting a code nobody uses yet.
MOBILE_PREFIXES = frozenset(
    {"20", "33", "50", "55", "77", "88", *(str(code) for code in range(90, 100))}
)
GEOGRAPHIC_PREFIXES = frozenset(str(code) for code in range(61, 80))
VALID_PREFIXES = MOBILE_PREFIXES | GEOGRAPHIC_PREFIXES

ERROR_MESSAGE = (
    "Enter a valid Uzbek phone number, e.g. +998 90 123 45 67"
)


def normalize_phone(raw: str) -> str:
    """Return the number as +998XXXXXXXXX, or raise ValueError.

    Accepts what people actually type: spaces, dashes, brackets, a leading +,
    00 international prefix, with or without the country code.
    """
    digits = re.sub(r"\D", "", raw or "")
    # 00998... (international prefix) and a stray trunk 0 both go the same way.
    digits = digits.lstrip("0")

    if len(digits) == SUBSCRIBER_LENGTH:
        subscriber = digits
    elif len(digits) == len(COUNTRY_CODE) + SUBSCRIBER_LENGTH and digits.startswith(COUNTRY_CODE):
        subscriber = digits[len(COUNTRY_CODE):]
    else:
        raise ValueError(ERROR_MESSAGE)

    if subscriber[:2] not in VALID_PREFIXES:
        raise ValueError(ERROR_MESSAGE)

    return f"+{COUNTRY_CODE}{subscriber}"
