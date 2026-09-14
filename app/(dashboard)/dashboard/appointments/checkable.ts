/**
 * "Дууссан" чекбокс гарах төлөвүүд — хүлээгдэж буйг эхлээд баталгаажуулна.
 *
 * 'use client' файлд байлгахгүй: server component (жагсаалт хуудас) ч
 * дууддаг, client файлаас экспортолсон функцыг сервер дуудаж чадахгүй.
 */
const CHECKABLE = ['confirmed', 'reminded', 'completed'];

export const isCheckable = (status: string) => CHECKABLE.includes(status);
