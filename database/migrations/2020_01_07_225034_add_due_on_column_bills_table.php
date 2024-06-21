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
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn('end_at');
            $table->dropColumn('start_at');
            $table->date('end_on')->after('amount')->nullable();
            $table->date('start_on')->after('amount')->nullable();
            $table->integer('day_due_on')->after('amount')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn('day_due_on');
            $table->dropColumn('end_on');
            $table->dropColumn('start_on');
            $table->timestamp('end_at')->after('amount')->nullable();
            $table->timestamp('start_at')->after('amount')->nullable();
        });
    }
};
