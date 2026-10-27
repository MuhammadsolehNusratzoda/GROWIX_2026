using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Domain.Constants;

namespace PharmacyPro.API.Controllers;

[Route("api/stock")]
[Authorize(Roles = Roles.Admin)]
public class StockController(IStockService service) : BaseApiController
{
    // GET /api/stock: чӣ қадар маҳсулот аз ҳар фирма дар дасти мост ва арзиши он
    [HttpGet]
    public async Task<IActionResult> Get() => Result(await service.GetReportAsync());
}
