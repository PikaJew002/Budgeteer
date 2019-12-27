<?php

namespace App\Policies;

use App\User;
use App\Bill;
use Illuminate\Auth\Access\HandlesAuthorization;

class BillPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any bills.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function index(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the bill.
     *
     * @param  \App\User  $user
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function view(User $user, Bill $bill)
    {
        return $bill->user_id == $user;
    }

    /**
     * Determine whether the user can create bills.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the bill.
     *
     * @param  \App\User  $user
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function update(User $user, Bill $bill)
    {
        return $bill->user_id == $user;
    }

    /**
     * Determine whether the user can delete the bill.
     *
     * @param  \App\User  $user
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function delete(User $user, Bill $bill)
    {
        return $bill->user_id == $user;
    }

    /**
     * Determine whether the user can restore the bill.
     *
     * @param  \App\User  $user
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function restore(User $user, Bill $bill)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the bill.
     *
     * @param  \App\User  $user
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function forceDelete(User $user, Bill $bill)
    {
        //
    }
}