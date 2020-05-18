<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContributionPaycheckTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contribution_paycheck', function (Blueprint $table) {
            $table->unsignedBigInteger('contribution_id');
            $table->unsignedBigInteger('paycheck_id');
            $table->date('due_on');
            $table->date('paid_on')->nullable();
            $table->timestamps();

            $table->foreign('contribution_id')->references('id')->on('contributions')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('paycheck_id')->references('id')->on('paychecks')->onDelete('cascade')->onUpdate('cascade');

            $table->primary(['contribution_id', 'paycheck_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contribution_paycheck');
    }
}
