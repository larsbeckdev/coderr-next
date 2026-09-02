from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from auth_app.models import Profile

GUEST_USERS = [
    {
        'username': 'andrey',
        'password': 'asdasd',
        'email': 'andrey@example.com',
        'type': Profile.ProfileType.CUSTOMER,
    },
    {
        'username': 'kevin',
        'password': 'asdasd24',
        'email': 'kevin@example.com',
        'type': Profile.ProfileType.BUSINESS,
    },
]


class Command(BaseCommand):
    """Creates the two guest accounts the frontend login buttons use."""

    help = 'Create the guest customer and guest business account.'

    def handle(self, *args, **options):
        """Create every missing guest account and report the result."""
        for guest in GUEST_USERS:
            created = self.create_guest(guest)
            state = 'created' if created else 'already exists'
            self.stdout.write(f'{guest["username"]}: {state}')

    def create_guest(self, guest):
        """Create one guest account, return False if it already exists."""
        if User.objects.filter(username=guest['username']).exists():
            return False
        user = User.objects.create_user(
            username=guest['username'],
            email=guest['email'],
            password=guest['password'],
        )
        Profile.objects.create(user=user, type=guest['type'])
        return True
