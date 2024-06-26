<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
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
            $table->double('amount', 8, 2)->nullable();
            $table->double('amount_project', 8, 2)->nullable();
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
};
