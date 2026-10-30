<?php

// Returns the option list as plain text (Content-Type: text/plain), one option per line.
//
// Format: value|Text
// If a line contains no "|", the line itself is used as both value and text.
//
// Uses the default request parameters sent by AvalynxSelect:
//   q      - the search term
//   length - number of items to fetch (default: 25)
//   start  - starting index for fetching items (default: 0)

if (!file_exists(__DIR__ . '/demo2.db')) {
	include __DIR__ . '/createdb.php';
}

$search = isset($_GET['q']) ? (string)$_GET['q'] : '';
$length = isset($_GET['length']) ? (int)$_GET['length'] : 25;
$start = isset($_GET['start']) ? (int)$_GET['start'] : 0;

header('Content-Type: text/plain; charset=utf-8');

try {
	$pdo = new PDO('sqlite:' . __DIR__ . '/demo2.db');
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$where = '';
	$params = [];
	if ($search !== '') {
		$where = 'WHERE company LIKE :search OR price LIKE :search';
		$params[':search'] = '%' . $search . '%';
	}

	$query = "SELECT id, company, price FROM company $where ORDER BY company LIMIT :limit OFFSET :offset";
	$stmt = $pdo->prepare($query);
	foreach ($params as $key => $value) {
		$stmt->bindValue($key, $value);
	}
	$stmt->bindValue(':limit', $length, PDO::PARAM_INT);
	$stmt->bindValue(':offset', $start, PDO::PARAM_INT);
	$stmt->execute();

	while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
		echo $row['id'] . '|' . $row['company'] . ' (' . number_format($row['price'], 0, ',', '.') . " €)\n";
	}
} catch (PDOException $e) {
	http_response_code(500);
	echo 'Error: ' . $e->getMessage() . "\n";
}
