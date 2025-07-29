<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\DB;

class MonthlyPresenceExportController extends Controller
{
    public function export(Request $request)
    {
        $month = $request->input('month'); // ex: 2025-07
        if (!$month) return response()->json(['error' => 'Mois requis'], 400);

        $dateStart = "$month-01";
        $dateEnd = date("Y-m-t", strtotime($dateStart)); // Dernier jour du mois
        $daysInMonth = date('t', strtotime($dateStart));

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // En-têtes
        $headers = [
            'Matricules',
            'Noms et prénoms',
            "Dates d'embauche",
            'Fonctions',
            'sortie',
            'Présence'
        ];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $headers[] = (string)$d;
        }
        $headers = array_merge($headers, [
            'Travaillés',
            'Absences',
            'Congés',
            'congé consommé',
            'Nombre de jours recup',
            'Total des jours'
        ]);
        $sheet->fromArray($headers, null, 'A1');

        // Récupération des utilisateurs
        $users = DB::table('users')->get();
        $row = 2;

        foreach ($users as $user) {
            $ligne = [
                $user->id ?? '',
                ($user->name ?? '') . ' ' . ($user->prenom ?? ''),
                $user->dateEmbauche ?? '',
                $user->fonction ?? '',
                $user->date_sortie ?? ''
            ];

            $presence = [];
            $worked = 0;
            $absent = 0;
            $conges = 0;
            $retard = 0;

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $currentDate = "$month-" . str_pad($d, 2, '0', STR_PAD_LEFT);

                $pointage = DB::table('pointages')
                    ->where('user_id', $user->id)
                    ->whereDate('date', $currentDate)
                    ->first();

                $conge = DB::table('absence_requests')
                    ->where('user_id', $user->id)
                    ->where('statut', 'approved')
                    ->whereDate('dateDebut', '<=', $currentDate)
                    ->whereDate('dateFin', '>=', $currentDate)
                    ->first();

                if ($conge) {
                    $presence[] = 'C';
                    $conges++;
                } elseif (!$pointage) {
                    $presence[] = 'X';
                    $absent++;
                } else {
                    switch ($pointage->statutJour) {
                        case 'present':
                            $presence[] = '✔';
                            $worked++;
                            break;
                        case 'retard':
                            $presence[] = 'R';
                            $worked++;
                            $retard++;
                            break;
                        case 'absent':
                        default:
                            $presence[] = 'X';
                            $absent++;
                            break;
                    }
                }
            }

            // La colonne Présence = nombre de jours présent ou retard
            $nbPresence = $worked;
            $ligne[] = $nbPresence;
            $ligne = array_merge($ligne, $presence, [$worked, $absent, $conges, '', '', $daysInMonth]);
            $sheet->fromArray($ligne, null, 'A' . $row);

            // Coloration des cellules de présence/absence
            $colStart = 7; // La première colonne de jour (A=1, donc G=7)
            for ($i = 0; $i < $daysInMonth; $i++) {
                $cell = chr(64 + $colStart + $i) . $row;
                $val = $presence[$i];
                if ($val === '✔' || $val === 'R') {
                    $sheet->getStyle($cell)->getFont()->getColor()->setRGB('008000'); // vert
                } elseif ($val === 'X') {
                    $sheet->getStyle($cell)->getFont()->getColor()->setRGB('FF0000'); // rouge
                }
            }
            $row++;
        }

        // Ajustement largeur colonnes
        foreach (range('A', $sheet->getHighestColumn()) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Style des en-têtes
        $highestColumn = $sheet->getHighestColumn();
        $sheet->getStyle('A1:' . $highestColumn . '1')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E0E0E0']
            ]
        ]);

        // Téléchargement
        $filename = "Pointages_" . $month . ".xlsx";
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportPointages(Request $request)
    {
        return $this->export($request);
    }
}
