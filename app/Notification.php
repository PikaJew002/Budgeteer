<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    public function notifiable() {
        return $this->morphTo();
    }

    public function user() {
        return $this->belongsTo('App\User');
    }
}
