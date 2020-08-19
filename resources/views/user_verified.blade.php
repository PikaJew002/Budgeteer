@extends('layouts.app')

@section('content')
    <main class="py-2">
      <div class="container">
        <div class="card bg-transparent">
          <div class="card-header bg-smokewhite-100">
            <h2>User Verified!</h2>
          </div>
          <div class="card-body bg-white-50">
            <p>
              The User {{ $user->name }} ({{ $user->email }}) was verified and has been notified.
            </p>
          </div>
        </div>
      </div>
    </main>
@endsection
