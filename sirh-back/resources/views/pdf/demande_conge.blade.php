<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Demande de congé</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            background-image: url('{{ public_path('images/letter.jpg') }}');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center center;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
     
        .header-logos { text-align: center; margin-bottom: 24px; }
        .logo { height: 80px; object-fit: contain; margin: 0 18px; }
        .center { text-align: center; margin: 0; }
        .title { font-size: 22px; font-weight: bold; text-align: center; margin: 40px 0 30px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px;}
        td, th { padding: 6px; vertical-align: top; }
        .bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .signature-space { height: 50px; }
        .bordered { border: 1px solid #333; }
        .signature-img { width: 120px; margin-top: 10px; }
        .cachet-img { width: 80px; margin-top: 10px; }
        table { width: 100%; }
        tr { text-align: center }
        .title{margin-top:200px}
        .wid{width:85%;text-align:center;margin:auto}
    </style>
</head>
<body>
     
       <div class="wid">
        <div class="title">Demande de congé</div>
        <div style="text-align: center; margin-bottom: 20px;">
            Tanger le, {{ \Carbon\Carbon::parse($conge->created_at)->format('d/m/Y') }}
        </div>
        <table>
            <tr>
                <td class="bold">Nom :</td>
                <td>{{ $conge->user->name }}</td>
                <td class="bold">Prénom :</td>
                <td>{{ $conge->user->prenom }}</td>
            </tr>
            <tr>
                <td class="bold">Fonction :</td>
                <td colspan="3">{{$conge->user->fonction }}</td>
            </tr>
            <tr>
                <td class="bold">Durée demandée :</td>
                @php
                    $debut = \Carbon\Carbon::parse($conge->dateDebut ?? $conge->date_debut);
                    $fin = \Carbon\Carbon::parse($conge->dateFin ?? $conge->date_fin);
                    $duree = $debut->diffInDays($fin) + 1;
                @endphp
                <td>{{ $duree }} jours</td>
                <td class="bold">Début de congé :</td>
                <td>{{ \Carbon\Carbon::parse($conge->dateDebut)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td class="bold">Fin de congé :</td>
                <td>{{ \Carbon\Carbon::parse($conge->dateFin)->format('d/m/Y') }}</td>
                <td class="bold">Date de reprise :</td>
                <td>{{ \Carbon\Carbon::parse($conge->dateFin)->addDay()->format('d/m/Y') }}</td>
            </tr>
        </table>

        <div class="signature-cachet">
    <table border="0">
            <tr><td colspan="2">La Direction RH</td></tr>
            <tr>
                <td>
                    Signature<br>
                    @if($user->societe_id == 2)
                        <img src="{{ public_path('images/sign.jpg') }}" class="signature-img" alt="Signature">
                    @endif
                </td>
                
            </tr>
        </table>
    </div>


    </div>
</body>
</html>
