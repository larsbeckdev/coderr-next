from django.db.models import Avg
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_app.models import Profile
from offers_app.models import Offer
from reviews_app.models import Review


class BaseInfoView(APIView):
    """Aggregated platform statistics shown on the landing page."""

    permission_classes = [AllowAny]

    def get(self, request):
        """Return review, rating, business profile and offer statistics."""
        average = Review.objects.aggregate(value=Avg('rating'))['value']
        data = {
            'review_count': Review.objects.count(),
            'average_rating': round(average, 1) if average else 0.0,
            'business_profile_count': Profile.objects.filter(
                type=Profile.ProfileType.BUSINESS).count(),
            'offer_count': Offer.objects.count(),
        }
        return Response(data, status=status.HTTP_200_OK)
