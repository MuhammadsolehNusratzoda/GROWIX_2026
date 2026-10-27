using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Domain.Constants;

namespace PharmacyPro.API.Controllers;

[Route("api/firm-ledger")]
[Authorize(Roles = Roles.Admin)]
public class FirmLedgerController(IFirmLedgerService service) : BaseApiController
{
    // GET /api/firm-ledger/{firmId}?from=...&to=...
    // Кадом маҳсулоти ин фирма чанд дона ва ба чанд сомонӣ фурӯхта шуд
    [HttpGet("{firmId:int}")]
    public async Task<IActionResult> Get(int firmId, [FromQuery] DateTime? from, [FromQuery] DateTime? to) =>
        Result(await service.GetAsync(firmId, from, to));
}
