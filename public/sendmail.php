<?php
// Куда отправлять заявки
$to = "artemikareshov@gmail.com"; // ← сюда впишите свою почту

// Получаем данные из формы
$name = $_POST['name'] ?? '';
$phone = $_POST['phone'] ?? '';
$service = $_POST['source'] ?? '';
$extra = '';

// Если есть дополнительные поля (например, select или textarea)
foreach ($_POST as $key => $value) {
    if (!in_array($key, ['name', 'phone', 'source'])) {
        $extra .= "$key: $value\n";
    }
}

// ТЕСТ: Записываем заявку в файл для проверки
file_put_contents('test.txt', "Форма отправлена: $name, $phone, $service\n", FILE_APPEND);

// Формируем письмо
$subject = "Заявка с сайта ($service)";
$message = "Имя: $name\nТелефон: $phone\nИсточник: $service\n$extra";
$headers = "Content-type: text/plain; charset=utf-8\r\n";

// Отправляем письмо
$success = mail($to, $subject, $message, $headers);

// Ответ для JS/AJAX или редирект
if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    echo $success ? 'OK' : 'ERROR';
} else {
    header("Location: thankyou.html");
    exit;
}
?> 