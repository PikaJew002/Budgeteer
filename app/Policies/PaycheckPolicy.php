<?php

namespace App\Policies;

use App\User;
use App\Paycheck;
use App\Bill;
use App\Contribution;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaycheckPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any paychecks.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the paycheck.
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function view(User $user, Paycheck $paycheck)
    {
        return $user->id == $paycheck->income->user_id;
    }

    /**
     * Determine whether the user can create paychecks.
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function create(User $user, Paycheck $paycheck)
    {
        return $user->id == $paycheck->income->user_id;
    }

    /**
     * Determine whether the user can update the paycheck.
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function update(User $user, Paycheck $paycheck)
    {
        $paycheck->load('income'); // needed in case a new income_id is assigned
        return $user->id == $paycheck->income->user_id;
    }

    /**
     * Determine whether the user can delete the paycheck.
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function delete(User $user, Paycheck $paycheck)
    {
        return $user->id == $paycheck->income->user_id;
    }

    /**
     * Determine whether the user can restore the paycheck.
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function restore(User $user, Paycheck $paycheck)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the paycheck.
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function forceDelete(User $user, Paycheck $paycheck)
    {
        //
    }

    /**
     * The following methods are for Bill-Paycheck association management
     */

    /**
     * Determine whether the user can create the bill-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function attachBill(User $user, Paycheck $paycheck, Bill $bill)
    {
        return $user->id == $paycheck->income->user_id && $user->id == $bill->user_id;
    }

    /**
     * Determine whether the user can update the bill-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @param  \App\Bill  $bill
     * @return mixed
     */

    public function updatePivotBill(User $user, Paycheck $paycheck, Bill $bill)
    {
        return $user->id == $paycheck->income->user_id && $user->id == $bill->user_id;
    }

    /**
     * Determine whether the user can delete the bill-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @param  \App\Bill  $bill
     * @return mixed
     */
    public function detachBill(User $user, Paycheck $paycheck, Bill $bill)
    {
        return $user->id == $paycheck->income->user_id && $user->id == $bill->user_id;
    }

    /**
     * The following methods are for Contribution-Paycheck association management
     */

    /**
     * Determine whether the user can create the contribution-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function attachContribution(User $user, Paycheck $paycheck, Contribution $contribution)
    {
        return $user->id == $paycheck->income->user_id && $user->id == $contribution->goal->user_id;
    }

    /**
     * Determine whether the user can update the contribution-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @param  \App\Contribution  $contribution
     * @return mixed
     */

    public function updatePivotContribution(User $user, Paycheck $paycheck, Contribution $contribution)
    {
        return $user->id == $paycheck->income->user_id && $user->id == $contribution->goal->user_id;
    }

    /**
     * Determine whether the user can delete the contribution-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Paycheck  $paycheck
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function detachContribution(User $user, Paycheck $paycheck, Contribution $contribution)
    {
        return $user->id == $paycheck->income->user_id && $user->id == $contribution->goal->user_id;
    }
}
