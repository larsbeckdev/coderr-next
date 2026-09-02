from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    """Additional platform data attached to a Django ``User``."""

    class ProfileType(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        BUSINESS = 'business', 'Business'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    type = models.CharField(
        max_length=20,
        choices=ProfileType.choices,
        default=ProfileType.CUSTOMER,
    )
    file = models.FileField(upload_to='profiles/', blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, default='')
    tel = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='')
    working_hours = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        ordering = ['user__username']

    def __str__(self):
        return f'{self.user.username} ({self.type})'
