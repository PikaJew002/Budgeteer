<?php

namespace App\Providers;

use App\Income;
use App\Paycheck;
use App\Bill;
use App\Goal;
use App\Contribution;
use App\Policies\IncomePolicy;
use App\Policies\PaycheckPolicy;
use App\Policies\BillPolicy;
use App\Policies\GoalPolicy;
use App\Policies\ContributionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Income::class => IncomePolicy::class,
        Paycheck::class => PaycheckPolicy::class,
        Bill::class => BillPolicy::class,
        Goal::class => GoalPolicy::class,
        Contribution::class => ContributionPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
    }
}
