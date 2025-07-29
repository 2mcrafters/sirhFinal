<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepartementController;
use App\Http\Controllers\AbsenceRequestController;
use App\Http\Controllers\StatistiquesController;
use App\Http\Controllers\PointageController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AbsenceRequestExcelController;
use App\Http\Controllers\PointageImportController;
use App\Http\Controllers\DepartementExcelController;
use App\Http\Controllers\PointageExcelController;
use App\Http\Controllers\UserExcelController;
use App\Http\Controllers\StatistiquesExcelController;
use App\Http\Controllers\SocieteController;
use App\Http\Controllers\PointageDetailController;
use App\Http\Controllers\MonthlyPresenceExportController;
use App\Http\Controllers\TypeDocController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\UserTypeDocController;
use App\Http\Middleware\RoleMiddleware;
Route::get('/export-pointages', [MonthlyPresenceExportController::class, 'exportPointages']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/employes', [UserController::class, 'store']);

Route::post('/import-pointages', [PointageImportController::class, 'import'])->name('import.pointages');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
Route::get('/statistiques/presence', [StatistiquesController::class, 'statistiquesPresence']);
Route::get('/departements', [DepartementController::class, 'index']);
Route::post('/departements', [DepartementController::class, 'store']);
Route::put('/departements', [DepartementController::class, 'update']);
Route::delete('/departements', [DepartementController::class, 'destroy']);
Route::get('/pointages-details', [PointageDetailController::class, 'index']);

Route::get('/societes', [SocieteController::class, 'index']);
Route::post('/societes', [SocieteController::class, 'store']);
Route::put('/societes', [SocieteController::class, 'update']);
Route::delete('/societes', [SocieteController::class, 'destroy']);
Route::post('/users/onesignal-player-id', [UserController::class, 'updatePlayerId']);


Route::get('/employes', [UserController::class, 'index']);
Route::put('/employes/update/{id}', [UserController::class, 'update']);
// Route::put('/users/affecter/{id}', [UserController::class, 'updateSocieteDepartement']);
Route::post('/users/affecter-societe-departement', [UserController::class, 'affecterSocieteDepartement']);

Route::delete('/employes', [UserController::class, 'destroy']);
Route::get('/employes/temp', [UserController::class, 'EmployeTemp']);

Route::get('/absences', [AbsenceRequestController::class, 'index']);
Route::post('/absences', [AbsenceRequestController::class, 'store']);
Route::match(['post', 'put'], '/absences/update/{id}', [AbsenceRequestController::class, 'update']);
Route::delete('/absences', [AbsenceRequestController::class, 'destroy']);


Route::get('/pointages', [PointageController::class, 'index']);
Route::post('/pointages', [PointageController::class, 'store']);
Route::put('/pointages', [PointageController::class, 'update']);
Route::delete('/pointages', [PointageController::class, 'destroy']);
Route::put('/pointages/{id}/valider', [PointageController::class, 'valider']);
Route::put('/pointages/{id}/invalider', [PointageController::class, 'invalider']);

// Route::get('/export-pointages', [PointageExcelController::class, 'exportPointages']);

//Docs
Route::resource('type-docs', TypeDocController::class);
Route::get('/user-docs', [UserTypeDocController::class, 'getUserDocs']);
Route::post('/user-docs/{userId}', [UserTypeDocController::class, 'uploadDocument']);
Route::post('/user-docs/{userId}/multiple', [UserTypeDocController::class, 'uploadMultipleDocuments']);
Route::delete('/user-docs/{userId}/{typeDocId}', [UserTypeDocController::class, 'deleteDocument']);


//pub et vote
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{id}', [PublicationController::class, 'show']);
Route::post('/publications', [PublicationController::class, 'store']);
Route::put('/publications/{id}/statut', [PublicationController::class, 'update']);
Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);
Route::post('/publications/bulk-delete', [PublicationController::class, 'destroyMany']);


// Voter à un sondage
Route::post('/votes', [VoteController::class, 'store']);
// Récupérer les votes (tous pour RH, sinon ceux de l'utilisateur connecté)
Route::get('/votes', [VoteController::class, 'index']);

});
// imports

Route::post('/departements/import', [DepartementExcelController::class, 'importDepartements'])->name('departements.import');
Route::post('/import-employes', [UserExcelController::class, 'import'])->name('import.employes');

// exports

Route::get('/export-employes', [UserExcelController::class, 'exportUsers']);
Route::get('/export-absence-requests', [AbsenceRequestExcelController::class, 'exportAbsences']);
Route::get('/export-departements', [DepartementExcelController::class, 'exportDepartements']);

Route::middleware(['auth:sanctum', 'role:RH'])->group(function () {
    Route::post('/assign-role', [AuthController::class, 'assignRole']);
    Route::get('/user_permission', function () {
        $user = auth()->user();
        return response()->json([
            'user' => $user->name,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions(),
        ]);
    });
});



Route::get('/conge/pdf/{id}', [AbsenceRequestController::class, 'generateCongePdf'])
    ->name('absence-requests.export-conge');
Route::get('/attestation-travail/pdf/{id}', [AbsenceRequestController::class, 'exportAttestationTravail']);


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



