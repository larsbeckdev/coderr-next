from rest_framework.pagination import PageNumberPagination


class OfferPagination(PageNumberPagination):
    """Page based pagination matching the page size used by the frontend."""

    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100
