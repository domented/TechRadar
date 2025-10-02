import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface AuditLog {
    id: string;
    username: string;
    userRole: string;
    action: string;
    resourceType?: string;
    resourceName?: string;
    ipAddress: string;
    timestamp: Date;
}

@Component({
    selector: 'app-audit-log-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container-fluid py-4">
      <div class="card">
        <div class="card-header bg-dark text-white">
          <h3><i class="fas fa-clipboard-list me-2"></i>Audit Logs</h3>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Zeitstempel</th>
                  <th>Benutzer</th>
                  <th>Rolle</th>
                  <th>Aktion</th>
                  <th>Resource</th>
                  <th>IP-Adresse</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of auditLogs">
                  <td>{{ log.timestamp | date:'dd.MM.yyyy HH:mm:ss' }}</td>
                  <td>{{ log.username }}</td>
                  <td>
                    <span class="badge" 
                          [class.bg-danger]="log.userRole === 'admin'"
                          [class.bg-secondary]="log.userRole === 'viewer'">
                      {{ log.userRole }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ log.action }}</span>
                  </td>
                  <td>{{ log.resourceName || '-' }}</td>
                  <td><small class="text-muted">{{ log.ipAddress }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditLogListComponent implements OnInit {
    auditLogs: AuditLog[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loadAuditLogs();
    }

    loadAuditLogs() {
        this.http.get<any>('/api/audit-logs?limit=50')
            .subscribe({
                next: (response) => {
                    this.auditLogs = response.data;
                },
                error: (error) => {
                    console.error('Error loading audit logs:', error);
                }
            });
    }
}