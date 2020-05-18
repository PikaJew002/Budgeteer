<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $casts = ['start_on' => 'date:Y-m-d', 'end_on' => 'date:Y-m-d'];

    public function paychecks() {
        return $this->belongsToMany('App\Paycheck')->withPivot(['amount', 'amount_project', 'due_on', 'paid_on'])->withTimestamps();
    }

    public function user() {
        return $this->belongsTo('App\User');
    }
}
