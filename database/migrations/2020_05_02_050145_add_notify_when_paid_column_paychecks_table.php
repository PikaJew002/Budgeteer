<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNotifyWhenPaidColumnPaychecksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('paychecks', function (Blueprint $table) {
            $table->datetime('notified_at')->nullable()->after('amount_project');
            $table->boolean('notify_when_paid')->default(false)->after('amount_project');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('paychecks', function (Blueprint $table) {
            $table->dropColumn('notify_when_paid');
            $table->dropColumn('notified_at');
        });
    }
}
