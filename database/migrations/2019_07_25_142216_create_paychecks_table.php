<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaychecksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('paychecks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('income_id');
            $table->double('amount', 8, 2)->nullable();
            $table->date('paid_on');
            $table->timestamps();

            $table->foreign('income_id')->references('id')->on('incomes')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('paychecks');
    }
}
