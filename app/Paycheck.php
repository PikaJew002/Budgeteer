<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Paycheck extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'float',
        ];
    }

    public function leftover()
    {
        $totalBills = $this->bills->reduce(function (float $carry, Bill $bill): float {
            return $carry + $bill->pivot->amount;
        }, 0.00);

        return $this->amount - $totalBills;
    }

    public function income() {
        return $this->belongsTo('App\Income');
    }

    public function bills() {
        return $this->belongsToMany('App\Bill')->using('App\BillPaycheck')->withPivot(['amount', 'amount_project', 'due_on', 'paid_on'])->withTimestamps();
    }

    public function notifications() {
        return $this->morphMany('App\Notification', 'notifiable');
    }
}
