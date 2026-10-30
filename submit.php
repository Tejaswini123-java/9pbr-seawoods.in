<?php

declare(strict_types=1);

ini_set('display_errors', '0');

ignore_user_abort(true);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;


/*
|--------------------------------------------------------------------------
| PHPMailer FILES
|--------------------------------------------------------------------------
*/

require __DIR__ . '/PHPMailer.php';
require __DIR__ . '/SMTP.php';
require __DIR__ . '/Exception.php';


/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

/* ---------------- SMTP ---------------- */

define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);

define(
    'SMTP_USER',
    'noreply@metro-satyam-kharghar.in'
);

/*
 * IMPORTANT:
 * Put your CURRENT Hostinger SMTP password here.
 * Do not use a password that has been publicly exposed.
 */
define(
    'SMTP_PASS',
    'Asset@2k24'
);

define(
    'MAIL_FROM',
    'noreply@metro-satyam-kharghar.in'
);


/* ---------------- EMAIL RECIPIENTS ---------------- */

define('MAIL_TO', [
    'deepak.assetindia@gmail.com',
    'ram.assetindia@gmail.com'
]);


/* ---------------- EMAIL SUBJECT ---------------- */

define(
    'MAIL_SUBJECT',
    'Adani 9 PBR Seawoods : New Lead from Website'
);


/* ---------------- CRM ---------------- */

define(
    'CRM_ENDPOINT',
    'https://crm.maharerahomes.in/api/wordpress/leads'
);


/* ---------------- WEBSITE ---------------- */

define(
    'DEFAULT_PAGE_URL',
    'https://9pbr-seawoods.in/'
);


/* ---------------- REDIRECT ---------------- */

define(
    'REDIRECT_OK',
    'thank-you.html'
);

define(
    'REDIRECT_ERROR',
    'index.html?error=submit_failed'
);


/*
|--------------------------------------------------------------------------
| ONLY POST REQUESTS
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    header('Location: index.html');
    exit;

}


/*
|--------------------------------------------------------------------------
| READ THE REQUEST BODY  (THE FIX)
|--------------------------------------------------------------------------
|
| assets/js/lead-form.js sends the lead as a JSON body using fetch().
| PHP does NOT put a JSON body into $_POST, so $_POST was empty and every
| lead was rejected as "missing_fields" without being e-mailed or sent to
| the CRM. Here we decode the JSON body into $_POST.
|
| A normal HTML form post (no JavaScript) still works as before.
|--------------------------------------------------------------------------
*/

$contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));

$isJsonRequest = strpos($contentType, 'application/json') !== false;

if ($isJsonRequest) {

    $decoded = json_decode(
        (string)file_get_contents('php://input'),
        true
    );

    if (is_array($decoded)) {
        $_POST = $decoded;
    }

}

$wantsJson = $isJsonRequest
    || strpos(
        strtolower((string)($_SERVER['HTTP_ACCEPT'] ?? '')),
        'application/json'
    ) !== false;


/*
|--------------------------------------------------------------------------
| RESPOND  (JSON for the JavaScript form, redirect for a plain form post)
|--------------------------------------------------------------------------
*/

function finish(
    bool $ok,
    string $redirect,
    string $message = '',
    int $status = 200
): void {

    global $wantsJson;

    if ($wantsJson) {

        http_response_code($ok ? 200 : $status);

        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');

        echo json_encode(
            [
                'ok'       => $ok,
                'message'  => $message,
                'redirect' => $redirect,
            ],
            JSON_UNESCAPED_SLASHES
        );

        exit;
    }

    header('Location: ' . $redirect, true, 303);
    exit;
}


/*
|--------------------------------------------------------------------------
| HONEYPOT
|--------------------------------------------------------------------------
|
| If your form contains:
|
| <input type="text" name="honeypot" style="display:none">
|
*/

if (!empty($_POST['honeypot'])) {
    finish(true, REDIRECT_OK);
}


/*
|--------------------------------------------------------------------------
| CLEAN FUNCTION
|--------------------------------------------------------------------------
*/

function clean($value): string
{
    if (!is_scalar($value)) {
        return '';
    }

    return htmlspecialchars(
        strip_tags(trim((string)$value)),
        ENT_QUOTES,
        'UTF-8'
    );
}


/*
|--------------------------------------------------------------------------
| EMAIL VALIDATION
|--------------------------------------------------------------------------
*/

function cleanEmail($value): string
{
    $email = trim((string)$value);

    if (
        $email !== '' &&
        filter_var($email, FILTER_VALIDATE_EMAIL)
    ) {
        return $email;
    }

    return '';
}


/*
|--------------------------------------------------------------------------
| PAGE URL
|--------------------------------------------------------------------------
*/

function getPageUrl(string $postedUrl): string
{
    $postedUrl = trim($postedUrl);

    if ($postedUrl !== '') {
        return $postedUrl;
    }

    $referer = trim(
        (string)($_SERVER['HTTP_REFERER'] ?? '')
    );

    if ($referer !== '') {
        return $referer;
    }

    return DEFAULT_PAGE_URL;
}


/*
|--------------------------------------------------------------------------
| VISITOR IP
|--------------------------------------------------------------------------
*/

function getVisitorIp(): string
{
    return trim(
        (string)(
            $_SERVER['REMOTE_ADDR'] ?? ''
        )
    );
}


/*
|--------------------------------------------------------------------------
| COLLECT FORM FIELDS
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| NAME
|--------------------------------------------------------------------------
|
| Supports:
| firstName
| name
| fname
|--------------------------------------------------------------------------
*/

$fname = clean(
    $_POST['firstName']
    ?? $_POST['fname']
    ?? $_POST['name']
    ?? ''
);


/*
|--------------------------------------------------------------------------
| FIRST NAME / LAST NAME
|--------------------------------------------------------------------------
*/

$firstName = clean(
    $_POST['first_name']
    ?? ''
);

$lastName = clean(
    $_POST['last_name']
    ?? ''
);


/*
|--------------------------------------------------------------------------
| EMAIL
|--------------------------------------------------------------------------
*/

$email = cleanEmail(
    $_POST['email'] ?? ''
);


/*
|--------------------------------------------------------------------------
| COUNTRY
|--------------------------------------------------------------------------
*/

$countryName = clean(
    $_POST['country']
    ?? $_POST['country_name']
    ?? 'India'
);

if ($countryName === '') {
    $countryName = 'India';
}


/*
|--------------------------------------------------------------------------
| COUNTRY CODE
|--------------------------------------------------------------------------
*/

$countryCode = clean(
    $_POST['country_code']
    ?? $_POST['isd']
    ?? '+91'
);

$countryCode = ltrim(
    $countryCode,
    '+'
);

if ($countryCode === '') {
    $countryCode = '91';
}


/*
|--------------------------------------------------------------------------
| PHONE
|--------------------------------------------------------------------------
|
| Supports:
|
| phone
| modal_my_mobile2
| mobile
|
|--------------------------------------------------------------------------
*/

$phoneRaw = clean(
    $_POST['phone']
    ?? $_POST['modal_my_mobile2']
    ?? ''
);


/*
 * Mobile may already contain country code,
 * for example:
 *
 * +919987105398
 */

$mobilePosted = trim(
    (string)(
        $_POST['mobile'] ?? ''
    )
);


if ($mobilePosted !== '') {

    /*
     * JS already supplied complete mobile.
     */
    $mobileDigits = preg_replace(
        '/\D+/',
        '',
        $mobilePosted
    ) ?? '';

    if ($mobileDigits !== '') {

        $mobile = '+' . $mobileDigits;

    } else {

        $mobile = '';

    }

} else {

    /*
     * Build mobile from country code + phone.
     */
    $phoneDigits = preg_replace(
        '/\D+/',
        '',
        $phoneRaw
    ) ?? '';

    if ($phoneDigits !== '') {

        $mobile = '+' .
            $countryCode .
            $phoneDigits;

    } else {

        $mobile = '';

    }
}


/*
|--------------------------------------------------------------------------
| BUILDER
|--------------------------------------------------------------------------
*/

$builder = clean(
    $_POST['builder']
    ?? 'Adani 9 PBR Seawoods'
);

if ($builder === '') {
    $builder = 'Adani 9 PBR Seawoods';
}


/*
|--------------------------------------------------------------------------
| PROJECT
|--------------------------------------------------------------------------
*/

$project = clean(
    $_POST['project']
    ?? $_POST['projectName']
    ?? 'Adani 9 PBR Seawoods'
);

if ($project === '') {
    $project = 'Adani 9 PBR Seawoods';
}


/*
|--------------------------------------------------------------------------
| LEAD SOURCE
|--------------------------------------------------------------------------
*/

$leadSource = clean(
    $_POST['lead_source']
    ?? $_POST['source']
    ?? 'Microsite'
);

if ($leadSource === '') {
    $leadSource = 'Microsite';
}


/*
|--------------------------------------------------------------------------
| ENQUIRED FOR / REQUIREMENT
|--------------------------------------------------------------------------
*/

$enquiredFor = clean(
    $_POST['enquiredfor']
    ?? $_POST['requirementType']
    ?? $_POST['enquiryType']
    ?? ''
);


/*
|--------------------------------------------------------------------------
| MARKETING TEAM
|--------------------------------------------------------------------------
*/

$marketingTeam = clean(
    $_POST['marketingTeam']
    ?? ''
);


/*
|--------------------------------------------------------------------------
| ORGANIZATION
|--------------------------------------------------------------------------
*/

$organizationName = clean(
    $_POST['organization_name']
    ?? $_POST['companyName']
    ?? 'Adani 9 PBR Seawoods'
);


/*
|--------------------------------------------------------------------------
| PAGE URL
|--------------------------------------------------------------------------
*/

$homeUrlRaw = clean(
    $_POST['home_url']
    ?? $_POST['referralURL']
    ?? $_POST['page_url']
    ?? ''
);

$homeUrl = getPageUrl(
    $homeUrlRaw
);

/*
 * The CRM needs the real URL (clean() turns & into &amp;),
 * so take the posted URL again and validate it.
 */
$crmPageUrl = '';

foreach (['home_url', 'referralURL', 'page_url'] as $urlKey) {

    $candidate = $_POST[$urlKey] ?? '';

    if (
        is_scalar($candidate) &&
        preg_match('#^https?://#i', trim((string)$candidate)) &&
        filter_var(trim((string)$candidate), FILTER_VALIDATE_URL)
    ) {
        $crmPageUrl = trim((string)$candidate);
        break;
    }
}

if ($crmPageUrl === '') {
    $crmPageUrl = DEFAULT_PAGE_URL;
}


/*
|--------------------------------------------------------------------------
| UTM / TRACKING
|--------------------------------------------------------------------------
*/

$utmSource = clean(
    $_POST['utm_source']
    ?? $_POST['mx_UTM_Source']
    ?? ''
);

$utmMedium = clean(
    $_POST['utm_medium']
    ?? $_POST['sourceMedium']
    ?? ''
);

$utmCampaign = clean(
    $_POST['utm_campaign']
    ?? $_POST['sourceCampaign']
    ?? ''
);

$utmTerm = clean(
    $_POST['utm_term']
    ?? $_POST['mx_UTM_Term']
    ?? ''
);

$utmPhysicalLocation = clean(
    $_POST['utm_physical_location']
    ?? $_POST['physicalLocation']
    ?? ''
);

$utmTargetId = clean(
    $_POST['utm_tragetid']
    ?? $_POST['mx_Target_id']
    ?? ''
);

$utmTarget = clean(
    $_POST['utm_target']
    ?? $_POST['target']
    ?? ''
);

$utmPlacement = clean(
    $_POST['utm_placement']
    ?? $_POST['x_UTM_Placement']
    ?? ''
);

$utmAdPosition = clean(
    $_POST['utm_adposition']
    ?? ''
);

$sourceContent = clean(
    $_POST['SourceContent']
    ?? $_POST['utm_content']
    ?? ''
);

$gclid = clean(
    $_POST['mx_gclid']
    ?? ''
);


/*
|--------------------------------------------------------------------------
| VISITOR IP
|--------------------------------------------------------------------------
*/

$visitorIp = clean(
    getVisitorIp()
);


/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

if (
    $fname === '' ||
    $mobile === ''
) {

    finish(
        false,
        'index.html?error=missing_fields',
        'Please enter your name and mobile number.',
        422
    );
}


/*
|--------------------------------------------------------------------------
| VALID PHONE
|--------------------------------------------------------------------------
*/

$phoneDigitsOnly = preg_replace(
    '/\D+/',
    '',
    $mobile
) ?? '';

if (strlen($phoneDigitsOnly) < 10) {

    finish(
        false,
        'index.html?error=invalid_phone',
        'Please enter a valid mobile number.',
        422
    );
}


/*
|--------------------------------------------------------------------------
| EMAIL BODY
|--------------------------------------------------------------------------
*/

$body = '
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
Adani 9 PBR Seawoods - New Lead
</title>

<style>

body {
    font-family: Arial, sans-serif;
    background-color: #ffffff;
    margin: 0;
    padding: 20px;
}

h2 {
    color: #c59601;
    margin-bottom: 20px;
    font-size: 20px;
}

h3 {
    color: #c59601;
    margin-top: 25px;
}

table {
    border-collapse: collapse;
    width: 600px;
    max-width: 100%;
}

td {
    border: 1px solid #999;
    padding: 10px;
    font-size: 14px;
    color: #333333;
}

td:first-child {
    font-weight: bold;
    background-color: #f5f5f5;
    width: 200px;
}

a {
    color: #1a73e8;
    text-decoration: underline;
}

</style>

</head>

<body>


<h2>
New Lead – ' . $project . '
</h2>


<table>


<tr>
<td>Name</td>
<td>' . $fname . '</td>
</tr>


<tr>
<td>Email</td>
<td>';

if ($email !== '') {

    $body .=
        '<a href="mailto:' .
        $email .
        '">' .
        $email .
        '</a>';

} else {

    $body .= '—';

}

$body .= '

</td>
</tr>


<tr>
<td>Phone</td>

<td>

<a href="tel:' .
$mobile .
'">' .
$mobile .
'</a>

</td>

</tr>


<tr>
<td>Country</td>
<td>' . $countryName . '</td>
</tr>


<tr>
<td>Enquired For</td>

<td>' .
(
    $enquiredFor !== ''
        ? $enquiredFor
        : 'Website Enquiry'
) .
'</td>

</tr>


<tr>
<td>Builder</td>
<td>' . $builder . '</td>
</tr>


<tr>
<td>Project</td>
<td>' . $project . '</td>
</tr>


<tr>
<td>Lead Source</td>
<td>' . $leadSource . '</td>
</tr>


<tr>
<td>Marketing Team</td>
<td>' .
(
    $marketingTeam !== ''
        ? $marketingTeam
        : '—'
) .
'</td>
</tr>


<tr>
<td>Organization</td>
<td>' .
(
    $organizationName !== ''
        ? $organizationName
        : '—'
) .
'</td>
</tr>


<tr>
<td>Page URL</td>

<td>

<a
    href="' . $homeUrl . '"
    target="_blank"
    rel="noopener"
>
' . $homeUrl . '
</a>

</td>

</tr>


<tr>
<td>Visitor IP</td>
<td>' . $visitorIp . '</td>
</tr>


</table>
';


/*
|--------------------------------------------------------------------------
| UTM / TRACKING TABLE
|--------------------------------------------------------------------------
*/

if (
    $utmSource !== '' ||
    $utmMedium !== '' ||
    $utmCampaign !== '' ||
    $utmTerm !== '' ||
    $sourceContent !== '' ||
    $utmTarget !== '' ||
    $utmTargetId !== '' ||
    $utmPlacement !== '' ||
    $utmAdPosition !== '' ||
    $utmPhysicalLocation !== '' ||
    $gclid !== ''
) {

    $body .= '

<br>

<h3>
UTM / Tracking
</h3>

<table>


<tr>
<td>UTM Source</td>
<td>' . $utmSource . '</td>
</tr>


<tr>
<td>UTM Medium</td>
<td>' . $utmMedium . '</td>
</tr>


<tr>
<td>UTM Campaign</td>
<td>' . $utmCampaign . '</td>
</tr>


<tr>
<td>UTM Term</td>
<td>' . $utmTerm . '</td>
</tr>


<tr>
<td>Source Content</td>
<td>' . $sourceContent . '</td>
</tr>


<tr>
<td>UTM Target</td>
<td>' . $utmTarget . '</td>
</tr>


<tr>
<td>Target ID</td>
<td>' . $utmTargetId . '</td>
</tr>


<tr>
<td>UTM Placement</td>
<td>' . $utmPlacement . '</td>
</tr>


<tr>
<td>UTM Ad Position</td>
<td>' . $utmAdPosition . '</td>
</tr>


<tr>
<td>Physical Location</td>
<td>' . $utmPhysicalLocation . '</td>
</tr>


<tr>
<td>GCLID</td>
<td>' . $gclid . '</td>
</tr>


</table>

';

}


$body .= '

</body>

</html>
';


/*
|--------------------------------------------------------------------------
| 1. SEND EMAIL
|--------------------------------------------------------------------------
*/

$mailSent = false;

$mailError = '';


$mail = new PHPMailer(true);


try {

    $mail->isSMTP();

    $mail->Host =
        SMTP_HOST;

    $mail->Port =
        SMTP_PORT;

    $mail->SMTPAuth =
        true;

    $mail->Username =
        SMTP_USER;

    $mail->Password =
        SMTP_PASS;

    $mail->SMTPSecure =
        PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Timeout =
        20;


    /*
     * FROM
     */
    $mail->setFrom(
        MAIL_FROM,
        'Adani 9 PBR Seawoods'
    );


    /*
     * TO
     */
    foreach (
        MAIL_TO
        as $recipient
    ) {

        $mail->addAddress(
            $recipient
        );

    }


    /*
     * REPLY TO
     */
    if ($email !== '') {

        $mail->addReplyTo(
            $email,
            $fname
        );

    }


    /*
     * HTML
     */
    $mail->isHTML(true);

    $mail->Subject =
        MAIL_SUBJECT;

    $mail->Body =
        $body;


    /*
     * TEXT FALLBACK
     */
    $mail->AltBody =
        "New Lead - Adani 9 PBR Seawoods\n\n" .

        "Name: " .
        $fname .
        "\n" .

        "Email: " .
        ($email ?: '—') .
        "\n" .

        "Phone: " .
        $mobile .
        "\n" .

        "Country: " .
        $countryName .
        "\n" .

        "Enquired For: " .
        ($enquiredFor ?: 'Website Enquiry') .
        "\n" .

        "Builder: " .
        $builder .
        "\n" .

        "Project: " .
        $project .
        "\n" .

        "Lead Source: " .
        $leadSource .
        "\n" .

        "Page URL: " .
        $homeUrl .
        "\n" .

        "Visitor IP: " .
        $visitorIp;


    /*
     * SEND
     */
    $mail->send();

    $mailSent = true;


} catch (PHPMailerException $e) {

    $mailError =
        $mail->ErrorInfo;

    error_log(
        'PHPMailer Error: ' .
        $mailError
    );

}


/*
|--------------------------------------------------------------------------
| 2. SEND LEAD TO CRM
|--------------------------------------------------------------------------
|
| This is based on the CRM structure from your
| working Tulip Kingdom code.
|--------------------------------------------------------------------------
*/

$crmSent = false;

$crmError = '';

$crmResponse = '';

$crmHttpCode = 0;


$crmPayload = [

    'Name' =>
        $fname,

    'Email' =>
        $email !== ''
            ? $email
            : 'noemail@gmail.com',

    'Mobile no' =>
        $mobile,

    'Requirement' =>
        $enquiredFor ?: '',

    'Page URL' =>
        $crmPageUrl

];


/*
|--------------------------------------------------------------------------
| JSON
|--------------------------------------------------------------------------
*/

$crmJson = json_encode(
    $crmPayload,
    JSON_UNESCAPED_SLASHES
);


if ($crmJson === false) {

    $crmError =
        'CRM JSON Error: ' .
        json_last_error_msg();

    error_log($crmError);

} else {


    /*
    |--------------------------------------------------------------------------
    | CURL
    |--------------------------------------------------------------------------
    */

    $ch = curl_init(
        CRM_ENDPOINT
    );


    if ($ch === false) {

        $crmError =
            'Unable to initialize CRM request';

        error_log($crmError);

    } else {


        curl_setopt_array(
            $ch,
            [

                CURLOPT_POST =>
                    true,

                CURLOPT_RETURNTRANSFER =>
                    true,

                CURLOPT_FOLLOWLOCATION =>
                    true,

                CURLOPT_HTTPHEADER =>
                    [

                        'Content-Type: application/json',

                        'Accept: application/json'

                    ],

                CURLOPT_POSTFIELDS =>
                    $crmJson,

                CURLOPT_CONNECTTIMEOUT =>
                    10,

                CURLOPT_TIMEOUT =>
                    30,

                CURLOPT_SSL_VERIFYPEER =>
                    true,

                CURLOPT_SSL_VERIFYHOST =>
                    2

            ]
        );


        /*
        |--------------------------------------------------------------------------
        | SEND
        |--------------------------------------------------------------------------
        */

        $crmResponse =
            curl_exec($ch);


        /*
        |--------------------------------------------------------------------------
        | HTTP STATUS
        |--------------------------------------------------------------------------
        */

        $crmHttpCode =
            (int)curl_getinfo(
                $ch,
                CURLINFO_HTTP_CODE
            );


        /*
        |--------------------------------------------------------------------------
        | CURL ERROR
        |--------------------------------------------------------------------------
        */

        $curlError =
            curl_error($ch);


        curl_close($ch);


        /*
        |--------------------------------------------------------------------------
        | CHECK CRM RESULT
        |--------------------------------------------------------------------------
        */

        if (
            $crmResponse !== false &&
            $crmHttpCode >= 200 &&
            $crmHttpCode < 300
        ) {

            $crmSent = true;

        } else {

            if ($curlError !== '') {

                $crmError =
                    $curlError;

            } else {

                $crmError =
                    'CRM HTTP ' .
                    $crmHttpCode .
                    ' Response: ' .
                    (string)$crmResponse;

            }

            error_log(
                'CRM API Error: ' .
                $crmError
            );

        }

    }

}


/*
|--------------------------------------------------------------------------
| 3. DEBUG LOG
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This creates:
|
| lead-debug.log
|
| It lets us see exactly what CRM returned.
|
|--------------------------------------------------------------------------
*/

$debugLine = sprintf(

    "[%s] " .

    "NAME=%s | " .

    "PHONE=%s | " .

    "EMAIL=%s | " .

    "MAIL=%s | " .

    "MAIL_ERROR=%s | " .

    "CRM=%s | " .

    "CRM_HTTP=%s | " .

    "CRM_RESPONSE=%s | " .

    "CRM_ERROR=%s\n",

    date('Y-m-d H:i:s'),

    $fname,

    $mobile,

    $email !== ''
        ? $email
        : '(none)',

    $mailSent
        ? 'YES'
        : 'NO',

    $mailError !== ''
        ? $mailError
        : '(none)',

    $crmSent
        ? 'YES'
        : 'NO',

    (string)$crmHttpCode,

    substr(
        str_replace(
            ["\r", "\n"],
            ' ',
            (string)$crmResponse
        ),
        0,
        1000
    ),

    $crmError !== ''
        ? $crmError
        : '(none)'

);


@file_put_contents(

    __DIR__ .
    '/lead-debug.log',

    $debugLine,

    FILE_APPEND |
    LOCK_EX

);


/*
|--------------------------------------------------------------------------
| 4. FINAL REDIRECT
|--------------------------------------------------------------------------
|
| SUCCESS:
| Email + CRM both successful.
|--------------------------------------------------------------------------
*/

/*
 * The lead is safe if it reached EITHER the e-mail OR the CRM
 * (the result of each one is written to lead-debug.log above).
 * Only show an error when the lead reached neither.
 */
if ($mailSent || $crmSent) {

    finish(true, REDIRECT_OK);

}

finish(
    false,
    REDIRECT_ERROR,
    'Unable to submit right now. Please call 8828238703.',
    500
);
