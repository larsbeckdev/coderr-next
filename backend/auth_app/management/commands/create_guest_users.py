from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from auth_app.models import Profile

GUEST_USERS = [
    {
        'username': 'mila',
        'password': 'demo1234',
        'email': 'mila@example.com',
        'first_name': 'Mila',
        'last_name': 'Hartmann',
        'type': Profile.ProfileType.CUSTOMER,
        'profile': {},
    },
    {
        'username': 'jonas',
        'password': 'demo1234',
        'email': 'jonas@example.com',
        'first_name': 'Jonas',
        'last_name': 'Reinhardt',
        'type': Profile.ProfileType.BUSINESS,
        # A business profile with empty fields makes the provider card on
        # every offer look broken, so the demo account arrives filled in.
        'profile': {
            'location': 'Leipzig',
            'tel': '+49 341 5550123',
            'working_hours': 'Mo-Fr, 9-17 Uhr',
            'description': (
                'Freelance-Entwickler für Web-Anwendungen. Schwerpunkt '
                'Django im Backend und React im Frontend.'
            ),
        },
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
            first_name=guest['first_name'],
            last_name=guest['last_name'],
        )
        Profile.objects.create(
            user=user, type=guest['type'], **guest['profile'])
        return True
