
from rest_framework import viewsets
from rest_framework.filters import SearchFilter

from .models import Ticket
from .serializers import TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):

    queryset = Ticket.objects.all().order_by('-created_at')

    serializer_class = TicketSerializer

    filter_backends = [SearchFilter]

    search_fields = ['title', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()

        status = self.request.query_params.get('status')

        if status:
            queryset = queryset.filter(status=status)

        return queryset

