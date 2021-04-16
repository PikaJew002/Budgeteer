<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Contribution extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
     protected $guarded = [];

     public function goal() {
        return $this->belongsTo('App\Goal');
     }

     public function paychecks() {
        return $this->belongsToMany('App\Paycheck')->using('App\ContributionPaycheck')->withPivot(['amount', 'amount_project', 'due_on', 'paid_on'])->withTimestamps();
     }
}
