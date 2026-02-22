import { NotificationRepository } from "@/repositories/notification.repository";
import { NotificationService } from "@/services/notification.service";
import { traceService } from "@/lib/aop";

const notificationRepo = traceService(new NotificationRepository(), "NotificationRepository");
export const notificationService = traceService(new NotificationService(notificationRepo), "NotificationService");
