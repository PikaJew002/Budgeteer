<?php

namespace App\Actions;

use App\Notification;
use DateTime;

class CheckForNotifications
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public static function execute()
    {
        // Checks for notifications that need to be sent today, sends, and then deletes
        $notifications = Notification::with(['user', 'notifiable'])->whereDate('notified_on', (new DateTime)->format('Y-m-d'))->get();
        if($notifications->isNotEmpty()) {
            foreach($notifications as $notification) {
                $notificationClass = "App\\Notifications\\".$notification->type;
                $notification->user->notify(new $notificationClass($notification->notifiable));
            }
            // delete notifications after they have been sent
            Notification::whereIn('id', $notifications->pluck('id'))->delete();
        }
    }
}
