import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  topBar: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  actionButtonDark: {
    backgroundColor: "#0F172A",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
  },

  buildingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buildingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  buildingIconText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 14,
  },
  buildingName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  buildingMeta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  buildingActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "800",
  },
  primarySmallButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },
  primarySmallButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  warningSmallButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },
  warningSmallButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  dangerSmallButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },
  dangerSmallButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#334155",
    fontWeight: "900",
  },
  buildingDetailBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },
  detailMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  roomCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  roomName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  roomMeta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  roomDescription: {
    marginTop: 6,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  roomActionColumn: {
    gap: 8,
    alignItems: "flex-end",
  },
  updateMiniButton: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  updateMiniButtonText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "800",
  },
  deleteMiniButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  deleteMiniButtonText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "800",
  },
});