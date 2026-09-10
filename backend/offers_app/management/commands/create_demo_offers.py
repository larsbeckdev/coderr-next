from django.core.management.base import BaseCommand
from django.db import transaction

from auth_app.models import Profile
from offers_app.models import Offer, OfferDetail

# Prices and delivery times deliberately spread across the catalogue: the offer
# list aggregates them into min_price and min_delivery_time, and the filters on
# /offers/ only show their effect when the values actually differ.
DEMO_OFFERS = [
    {
        'title': 'Landing Page mit Next.js',
        'description': (
            'Schnelle, SEO-freundliche Landing Page inklusive Responsive '
            'Design und Kontaktformular.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 5,
                'price': '450.00',
                'features': ['Eine Seite', 'Responsive', 'Kontaktformular'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 3,
                'delivery_time_in_days': 10,
                'price': '900.00',
                'features': [
                    'Bis zu fünf Seiten',
                    'Responsive',
                    'CMS-Anbindung',
                    'Basis-SEO',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 5,
                'delivery_time_in_days': 18,
                'price': '1800.00',
                'features': [
                    'Bis zu zehn Seiten',
                    'Responsive',
                    'CMS-Anbindung',
                    'SEO-Optimierung',
                    'Analytics-Setup',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'REST API mit Django',
        'description': (
            'Saubere REST-Schnittstelle mit Django REST Framework, inklusive '
            'Authentifizierung und Tests.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 7,
                'price': '600.00',
                'features': ['Bis zu fünf Endpunkte', 'Token-Auth'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 2,
                'delivery_time_in_days': 14,
                'price': '1400.00',
                'features': [
                    'Bis zu 15 Endpunkte',
                    'Token-Auth',
                    'Berechtigungen',
                    'Unit-Tests',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 4,
                'delivery_time_in_days': 25,
                'price': '2900.00',
                'features': [
                    'Unbegrenzte Endpunkte',
                    'Token-Auth',
                    'Berechtigungen',
                    'Testabdeckung über 80 Prozent',
                    'OpenAPI-Dokumentation',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'WordPress Theme nach Design',
        'description': (
            'Pixelgenaue Umsetzung eines vorhandenen Designs als eigenes '
            'WordPress-Theme.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 2,
                'delivery_time_in_days': 6,
                'price': '380.00',
                'features': ['Startseite', 'Responsive'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 3,
                'delivery_time_in_days': 12,
                'price': '750.00',
                'features': [
                    'Startseite und Unterseiten',
                    'Responsive',
                    'Blog-Templates',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 5,
                'delivery_time_in_days': 20,
                'price': '1500.00',
                'features': [
                    'Komplettes Theme',
                    'Responsive',
                    'Blog-Templates',
                    'WooCommerce',
                    'Performance-Tuning',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'Mobile App mit React Native',
        'description': (
            'Cross-Platform-App für iOS und Android aus einer gemeinsamen '
            'Codebasis.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 14,
                'price': '1200.00',
                'features': ['Drei Screens', 'iOS und Android'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 3,
                'delivery_time_in_days': 28,
                'price': '3200.00',
                'features': [
                    'Bis zu zehn Screens',
                    'iOS und Android',
                    'API-Anbindung',
                    'Push-Benachrichtigungen',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 5,
                'delivery_time_in_days': 45,
                'price': '6500.00',
                'features': [
                    'Unbegrenzte Screens',
                    'iOS und Android',
                    'API-Anbindung',
                    'Push-Benachrichtigungen',
                    'Store-Veröffentlichung',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'Datenbank-Optimierung PostgreSQL',
        'description': (
            'Analyse langsamer Abfragen, passende Indizes und ein Bericht mit '
            'den Messwerten vorher und nachher.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 3,
                'price': '350.00',
                'features': ['Analyse der fünf langsamsten Abfragen'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 2,
                'delivery_time_in_days': 8,
                'price': '800.00',
                'features': [
                    'Vollständige Query-Analyse',
                    'Index-Strategie',
                    'Bericht',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 3,
                'delivery_time_in_days': 15,
                'price': '1900.00',
                'features': [
                    'Vollständige Query-Analyse',
                    'Index-Strategie',
                    'Umsetzung der Migrationen',
                    'Monitoring-Setup',
                    'Bericht',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'CI/CD Pipeline mit GitHub Actions',
        'description': (
            'Automatisierte Tests, Builds und Deployments, damit jeder Merge '
            'auf main ohne Handarbeit live geht.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 4,
                'price': '400.00',
                'features': ['Test-Workflow', 'Linting'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 2,
                'delivery_time_in_days': 9,
                'price': '950.00',
                'features': [
                    'Test-Workflow',
                    'Linting',
                    'Docker-Build',
                    'Staging-Deployment',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 4,
                'delivery_time_in_days': 16,
                'price': '2100.00',
                'features': [
                    'Test-Workflow',
                    'Linting',
                    'Docker-Build',
                    'Staging- und Produktions-Deployment',
                    'Rollback-Strategie',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'Code-Review und Refactoring',
        'description': (
            'Durchsicht einer bestehenden Codebasis mit konkreten Vorschlägen '
            'und deren Umsetzung.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 2,
                'price': '250.00',
                'features': ['Review bis 1000 Zeilen', 'Schriftlicher Bericht'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 2,
                'delivery_time_in_days': 7,
                'price': '700.00',
                'features': [
                    'Review bis 5000 Zeilen',
                    'Schriftlicher Bericht',
                    'Umsetzung der kritischen Punkte',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 4,
                'delivery_time_in_days': 14,
                'price': '1600.00',
                'features': [
                    'Review der gesamten Codebasis',
                    'Schriftlicher Bericht',
                    'Umsetzung aller Punkte',
                    'Testabdeckung ergänzen',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
    {
        'title': 'Shopify Store einrichten',
        'description': (
            'Kompletter Shop-Aufbau inklusive Produktimport, Zahlungsarten '
            'und Versandregeln.'
        ),
        'packages': [
            {
                'title': 'Basic',
                'revisions': 1,
                'delivery_time_in_days': 5,
                'price': '500.00',
                'features': ['Theme-Setup', 'Bis zu 20 Produkte'],
                'offer_type': OfferDetail.OfferType.BASIC,
            },
            {
                'title': 'Standard',
                'revisions': 3,
                'delivery_time_in_days': 11,
                'price': '1100.00',
                'features': [
                    'Theme-Anpassung',
                    'Bis zu 100 Produkte',
                    'Zahlungsarten',
                    'Versandregeln',
                ],
                'offer_type': OfferDetail.OfferType.STANDARD,
            },
            {
                'title': 'Premium',
                'revisions': 5,
                'delivery_time_in_days': 22,
                'price': '2400.00',
                'features': [
                    'Individuelles Theme',
                    'Unbegrenzte Produkte',
                    'Zahlungsarten',
                    'Versandregeln',
                    'Marketing-Automation',
                ],
                'offer_type': OfferDetail.OfferType.PREMIUM,
            },
        ],
    },
]


class Command(BaseCommand):
    """Creates example offers so the demo has something to browse."""

    help = 'Create demo offers for the existing business accounts.'

    def handle(self, *args, **options):
        """Create every missing demo offer and report the result."""
        owners = self.business_users()
        if not owners:
            self.stderr.write(
                'No business account found. Run create_guest_users first.')
            return

        for index, offer in enumerate(DEMO_OFFERS):
            owner = owners[index % len(owners)]
            created = self.create_offer(offer, owner)
            state = 'created' if created else 'already exists'
            self.stdout.write(f'{offer["title"]} ({owner.username}): {state}')

    def business_users(self):
        """Return the business accounts the demo offers are spread across."""
        profiles = Profile.objects.filter(
            type=Profile.ProfileType.BUSINESS,
        ).select_related('user').order_by('user__username')
        return [profile.user for profile in profiles]

    @transaction.atomic
    def create_offer(self, offer, owner):
        """Create one offer with its three packages, skip known titles."""
        if Offer.objects.filter(user=owner, title=offer['title']).exists():
            return False
        created = Offer.objects.create(
            user=owner,
            title=offer['title'],
            description=offer['description'],
        )
        OfferDetail.objects.bulk_create([
            OfferDetail(offer=created, **package)
            for package in offer['packages']
        ])
        return True
