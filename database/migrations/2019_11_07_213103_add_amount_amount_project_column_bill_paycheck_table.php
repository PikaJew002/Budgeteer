<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAmountAmountProjectColumnBillPaycheckTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bill_paycheck', function (Blueprint $table) {
            $table->double('amount_project', 8, 2)->after('paycheck_id')->nullable();
            $table->double('amount', 8, 2)->after('paycheck_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bill_paycheck', function (Blueprint $table) {
            $table->dropColumn('amount');
            $table->dropColumn('amount_project');
        });
    }
}
