<?php

namespace App\Policies;

use App\User;
use App\Contribution;
use Illuminate\Auth\Access\HandlesAuthorization;

class ContributionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any contributions.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the contribution.
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function view(User $user, Contribution $contribution)
    {
        return $user->id == $contribution->goal->user_id;
    }

    /**
     * Determine whether the user can create contributions.
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function create(User $user, Contribution $contribution)
    {
        return $user->id == $contribution->goal->user_id;
    }

    /**
     * Determine whether the user can update the contribution.
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function update(User $user, Contribution $contribution)
    {
        return $user->id == $contribution->goal->user_id;
    }

    /**
     * Determine whether the user can delete the contribution.
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function delete(User $user, Contribution $contribution)
    {
        return $user->id == $contribution->goal->user_id;
    }

    /**
     * Determine whether the user can restore the contribution.
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function restore(User $user, Contribution $contribution)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the contribution.
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @return mixed
     */
    public function forceDelete(User $user, Contribution $contribution)
    {
        //
    }

    /**
     * The following methods are for Contribution-Paycheck association management
     */

    /**
     * Determine whether the user can create contribution-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function attachPaycheck(User $user, Contribution $contribution, Paycheck $paycheck)
    {
        return $user->id == $contribution->goal->user_id && $user->id == $paycheck->income->user_id;
    }

    /**
     * Determine whether the user can update contribution-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */

    public function updatePivotPaycheck(User $user, Contribution $contribution, Paycheck $paycheck)
    {
        return $user->id == $contribution->goal->user_id && $user->id == $paycheck->income->user_id;
    }

    /**
     * Determine whether the user can delete the contribution-paycheck association
     *
     * @param  \App\User  $user
     * @param  \App\Contribution  $contribution
     * @param  \App\Paycheck  $paycheck
     * @return mixed
     */
    public function detachPaycheck(User $user, Contribution $contribution, Paycheck $paycheck)
    {
        return $user->id == $contribution->goal->user_id && $user->id == $paycheck->income->user_id;
    }
}
