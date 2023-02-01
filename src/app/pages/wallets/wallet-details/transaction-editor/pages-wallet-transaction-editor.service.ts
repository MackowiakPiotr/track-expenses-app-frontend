import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, switchMap, tap } from 'rxjs';
import { SystemNotificationsService } from 'src/app/common/utils/system-notifications/system-notifications.service';
import { WalletTransaction } from '../pages-wallet-details-item.model';
import { PagesWalletDetailsService } from '../pages-wallet-details.service';
import { PagesWalletTransactionEditorComponent } from './pages-wallet-transaction-editor.component';

@Injectable({
  providedIn: 'root',
})
export class PagesWalletTransactionEditorService {
  public constructor(
    private readonly dialog: MatDialog,
    private readonly systemNotificationsService: SystemNotificationsService,
    private readonly pagesWalletDetailsService: PagesWalletDetailsService,
  ) { }

  public openEditor(transaction: WalletTransaction) : Observable<WalletTransaction | null> {
    return this.dialog.open<PagesWalletTransactionEditorComponent, WalletTransaction, WalletTransaction>(
      PagesWalletTransactionEditorComponent, {
        data: transaction,
      }).afterClosed().pipe(
      switchMap((transactionResp: WalletTransaction | undefined) => {
        return !!transactionResp ? this.makeRequest(transactionResp) : of(null);
      }),
      tap((transactionItem: WalletTransaction | null) => {
        if(transactionItem) {
          this.notify(transactionItem, transaction.id ? 'updated' : 'created');
        }
      }),
    );
  }

  private makeRequest(transaction: WalletTransaction): Observable<WalletTransaction> {
    return transaction.id ?
      this.pagesWalletDetailsService.editWalletTransaction(transaction) :
      this.pagesWalletDetailsService.createWalletTransaction(transaction);
  }

  private notify(updatedWallet: WalletTransaction | null, type: string): void {
    const message = !updatedWallet ?
      'Sorry. Something went wrong and your transaction was not saved. Contact administrator.' :
      `Congratulations! Your transaction was ${type} successfully.`;

    if(!updatedWallet) {
      this.systemNotificationsService.showNotification({ message });

      return;
    }

    this.systemNotificationsService.showNotification({ message });
  }
}