<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class PointageController extends Controller
{
  
        public function index()
{
    $user = auth()->user();

    if ($user->hasRole('RH')) {
        // RH peut voir tous les pointages des users actifs de sa société
        $userIds = User::where('societe_id', $user->societe_id)
                       ->where('statut', '!=', 'Inactif')
                       ->pluck('id');

        return Pointage::with(['user', 'societe'])
            ->whereIn('user_id', $userIds)
            ->get();
    }

    if ($user->hasAnyRole(['Chef_Dep', 'Chef_Projet'])) {
        // Chef_Dep ou Chef_Projet : voir les pointages du même département et société, uniquement users actifs
        $userIds = User::where('departement_id', $user->departement_id)
                       ->where('societe_id', $user->societe_id)
                       ->where('statut', '!=', 'Inactif')
                       ->pluck('id');

        return Pointage::with(['user', 'societe'])
            ->whereIn('user_id', $userIds)
            ->get();
    }

    if ($user->hasRole('Employe')) {
        // Employé : ne voir que ses propres pointages si il est actif
        if ($user->statut !== 'Inactif') {
            return Pointage::with(['user', 'societe'])
                ->where('user_id', $user->id)
                ->get();
        } else {
            return response()->json(['message' => 'Compte inactif.'], 403);
        }
    }

    return response()->json(['message' => 'Accès non autorisé.'], 403);
}

    
        /**
         * Store a newly created resource in storage.
         */
        public function store(Request $request)
{
    $rules = [
        'user_id' => 'required|exists:users,id',
        'date' => 'required|date',
        'heureEntree' => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
        'heureSortie' => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
        'statutJour' => 'nullable|in:present,absent,retard',
        'overtimeHours' => 'nullable|numeric',
        'societe_id' => 'required|exists:societes,id',
        'valider' => 'nullable|integer',
    ];

    $data = $request->all();
    $authUser = auth()->user();
    $societeId = $authUser->societe_id;
    $valider = 0;

    if (isset($data[0]) && is_array($data[0])) {
        foreach ($data as &$p) {
            if (!is_array($p)) continue;
            $p['societe_id'] = $societeId;
            $p['valider'] = $valider;
            $validated = validator($p, $rules)->validate();
            Pointage::create($validated);
        }
        return response()->json(['message' => 'Pointages ajoutés', 'societe_id' => $societeId]);
    } else {
        $data['societe_id'] = $societeId;
        $data['valider'] = $valider;
        $validated = validator($data, $rules)->validate();
        $pointage = Pointage::create($validated);
        return response()->json($pointage);
    }
}

    
    
        /**
         * Update the specified resource in storage.
         */
        public function update(Request $request)
{
    $datas = $request->all();
    // Si c'est un tableau de plusieurs pointages
    if (isset($datas[0]) && is_array($datas[0])) {
        foreach ($datas as $updateData) {
            if (!is_array($updateData) || !isset($updateData['id'])) continue; // 🟢 Sécurité
            $pointage = Pointage::findOrFail($updateData['id']);
            $rules = [
                'heureEntree' => [
                    'nullable',
                    'regex:/^\d{2}:\d{2}(:\d{2})?$/'
                ],
                'heureSortie' => [
                    'nullable',
                    'regex:/^\d{2}:\d{2}(:\d{2})?$/'
                ],
                'statutJour' => 'sometimes|in:present,absent,retard',
                'overtimeHours' => 'nullable|numeric',
                'societe_id' => 'sometimes|exists:societes,id',
            ];

            $validated = validator($updateData, $rules)->validate();
            $pointage->update($validated);
        }
        return response()->json(['message' => 'Pointages modifiés']);
    } else {
        // Cas d'une seule maj
        $updateData = $datas;
        if (!is_array($updateData) || !isset($updateData['id'])) {
            return response()->json(['message' => 'Format de données incorrect ou id manquant'], 422);
        }
        $pointage = Pointage::findOrFail($updateData['id']);
        $rules = [
            'heureEntree' => [
                'nullable',
                'regex:/^\d{2}:\d{2}(:\d{2})?$/'
            ],
            'heureSortie' => [
                'nullable',
                'regex:/^\d{2}:\d{2}(:\d{2})?$/'
            ],
            'statutJour' => 'sometimes|in:present,absent,retard',
            'overtimeHours' => 'nullable|numeric',
            'societe_id' => 'sometimes|exists:societes,id',
        ];
        $validated = validator($updateData, $rules)->validate();
        $pointage->update($validated);

        return response()->json(['message' => 'Pointage modifié']);
    }
}

    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request) {
        $ids = $request->input('ids');
        Pointage::whereIn('id', $ids)->delete();
        return response()->json(['message' => 'Pointages supprimés']);
    }


    public function valider($id)
    {
        $pointage = Pointage::findOrFail($id);

        if (Auth::user()->hasAnyRole(['RH'])) {
            $pointage->update(['valider' => 1]);

            return response()->json([
                'message' => 'Pointage validé avec succès.',
                'pointage' => $pointage
            ]);
        }

        return response()->json(['message' => 'Accès non autorisé. Seul le RH peut valider les pointages.'], 403);
    }

    /**
     * Invalider un pointage (passer de 1 à 0) - Accès : RH uniquement
     */
    public function invalider($id)
    {
        $pointage = Pointage::findOrFail($id);

        if (Auth::user()->hasRole('RH')) {
            $pointage->update(['valider' => 0]);

            return response()->json([
                'message' => 'Pointage invalidé avec succès.',
                'pointage' => $pointage
            ]);
        }

        return response()->json(['message' => 'Accès non autorisé. Seul le RH peut invalider les pointages.'], 403);
    }
}
