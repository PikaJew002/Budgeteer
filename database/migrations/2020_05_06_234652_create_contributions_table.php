<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContributionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contributions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('goal_id');
            $table->double('amount', 8, 2);
            $table->integer('day_due_on')->nullable();
            $table->date('start_on');
            $table->date('end_on');
            $table->timestamps();

            $table->foreign('goal_id')->references('id')->on('goals')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contributions');
    }
}
