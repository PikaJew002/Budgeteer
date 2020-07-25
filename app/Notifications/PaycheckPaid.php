<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

use App\Paycheck;

class PaycheckPaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Paycheck object
     *
     * @var App\Paycheck $paycheck
     */
    public $paycheck;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Paycheck $paycheck)
    {
        $this->paycheck = $paycheck;
        $paycheck->notified_at = now();
        $paycheck->save();
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $this->paycheck->load(['income', 'bills', 'contributions.goal']);
        $message = (new MailMessage)->line('You\'ve been paid from '.$this->paycheck->income->name.'!');
        // if the amount is projected
        if($this->paycheck->amount == null) {
            $message = $message->line('We see you marked this paycheck as projected.')
                               ->line('You should update the paycheck with the correct amount to see how much you actually have left over.');
        }
        $billsNotEmpty = $this->paycheck->bills->isNotEmpty();
        $contributionsNotEmpty = $this->paycheck->contributions->isNotEmpty();
        if($billsNotEmpty || $contributionsNotEmpty) {
            $billsAmount = 0;
            if($billsNotEmpty) {
                $message = $message->line('Bills coming out of this paycheck:');
                foreach($this->paycheck->bills as $bill) {
                    $amount = $bill->pivot->amount == null ? $bill->pivot->amount_project : $bill->pivot->amount;
                    $billsAmount = $billsAmount + $amount;
                    $message = $message->line(' - '.$bill->name.' $'.$amount);
                }
            }
            $contributionsAmount = 0;
            if($contributionsNotEmpty) {
                $message = $message->line('Contributions coming out of this paycheck:');
                foreach($this->paycheck->contributions as $contribution) {
                    $amount = $contribution->pivot->amount == null ? $contribution->pivot->amount_project : $contribution->pivot->amount;
                    $contributionsAmount = $contributionsAmount + $amount;
                    $message = $message->line(' - '.$contribution->goal->name.' $'.$amount);
                }
            }
            if($this->paycheck->amount == null) {
                $leftOver = $this->paycheck->amount_project - $billsAmount - $contributionsAmount;
                $message = $message->line('Projected left over (after bills and contributions):');
                $message = $message->line('$'.$leftOver);
            } else {
                $leftOver = $this->paycheck->amount - $billsAmount - $contributionsAmount;
                $message = $message->line('Left over (after bills and contributions):');
                $message = $message->line('$'.$leftOver);
            }
            $message = $message->line('Remember to log in and mark those bills/contributions as paid.');
        } else {
            $message = $message->line('Hmmm, you don\'t seem to have any bills or contributions assigned to this paycheck.')
                               ->line('Log in to assign any bills or contributions, pay (or save) them, and mark them as paid (or don\'t, it\'s your money, haha).');
        }
        return $message->action('Log in', url('/login'))
                           ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
