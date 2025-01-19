<?php

namespace App\Providers;

use App\Income;
use App\Paycheck;
use App\Bill;
use App\Policies\IncomePolicy;
use App\Policies\PaycheckPolicy;
use App\Policies\BillPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Income::class => IncomePolicy::class,
        Paycheck::class => PaycheckPolicy::class,
        Bill::class => BillPolicy::class,
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
