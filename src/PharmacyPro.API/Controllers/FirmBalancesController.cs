using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Domain.Constants;

namespace PharmacyPro.API.Controllers;

[Route("api/firm-balances")]
[Authorize(Roles = Roles.Admin)]
public class FirmBalancesController(IFirmBalanceService service) : BaseApiController
{
    // GET /api/firm-balances: қарзи ҳар фирма + қарзи умумӣ
    [HttpGet]
    public async Task<IActionResult> Get() => Result(await service.GetBalancesAsync());
}
